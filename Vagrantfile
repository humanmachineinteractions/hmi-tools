Vagrant.configure("2") do |config|
  #config.omnibus.chef_version = '11.16'
  #config.berkshelf.enabled = true

  config.vm.box = "precise64"

  config.vm.provider "virtualbox" do |v|
      v.memory = 3120
      v.cpus = 4
      v.customize ["modifyvm", :id, "--cpuexecutioncap", "100"]
      #v.gui = true
    end


  #config.ssh.insert_key = true
  #config.ssh.forward_agent = true
  config.ssh.password = "vagrant"

  config.vm.network "private_network", ip: "10.11.12.25"

  config.vm.synced_folder "app", "/home/vagrant/app"
  config.vm.synced_folder "deploy", "/home/vagrant/deploy"
  config.vm.synced_folder "../MITIE", "/home/MITIE"
  config.vm.synced_folder "../currently13", "/home/currently13"
  #config.vm.synced_folder "../test-voice-data", "/home/vagrant/test-voice-data"

  config.vm.provision :shell, :path => "deploy/provision.sh"

end

